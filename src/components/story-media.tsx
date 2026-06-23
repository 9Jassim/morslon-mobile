import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { createElement, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { getYouTubeId, toEmbedUrl } from '@/lib/highlights';
import { resolveProductImage } from '@/lib/images';
import type { HomeHighlight } from '@/lib/types';

const IMAGE_MS = 5000;
const EMBED_MS = 15000;

type MediaProps = {
  highlight: HomeHighlight;
  paused: boolean;
  onProgress: (p: number) => void;
  onComplete: () => void;
};

/** Renders a story's media and reports playback progress (0..1). */
export function StoryMedia(props: MediaProps) {
  const { highlight } = props;
  const isVideo = highlight.mediaType === 'video' && !!highlight.mediaUrl;
  const ytId = highlight.mediaType === 'embed' ? getYouTubeId(highlight.mediaUrl) : null;
  const isOtherEmbed = highlight.mediaType === 'embed' && !!highlight.mediaUrl && !ytId;

  if (isVideo) return <UploadedVideo {...props} />;
  if (ytId) return <YouTubeStory {...props} videoId={ytId} />;
  if (isOtherEmbed) return <PlainEmbed {...props} />;
  return <Cover {...props} />;
}

/* ── Uploaded video (expo-video, real duration) ───────────────────── */
function UploadedVideo({ highlight, paused, onProgress, onComplete }: MediaProps) {
  const player = useVideoPlayer(highlight.mediaUrl, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useEffect(() => {
    if (paused) player.pause();
    else player.play();
  }, [paused, player]);

  useEventListener(player, 'playToEnd', onComplete);

  useEffect(() => {
    const id = setInterval(() => {
      const dur = player.duration || 0;
      if (dur > 0) onProgress(Math.min(1, player.currentTime / dur));
    }, 100);
    return () => clearInterval(id);
  }, [player, onProgress]);

  return <VideoView player={player} style={styles.fill} contentFit="cover" nativeControls={false} />;
}

/* ── YouTube via IFrame API: chrome-free + real length ────────────── */
function youtubeHtml(id: string): string {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#p{position:fixed;inset:0}iframe{width:100%;height:100%}</style></head>
<body><div id="p"></div><script>
var player;
function send(m){var s=JSON.stringify(m);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s)}else{parent.postMessage(s,'*')}}
var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.body.appendChild(tag);
function onYouTubeIframeAPIReady(){player=new YT.Player('p',{videoId:'${id}',playerVars:{autoplay:1,mute:1,controls:0,modestbranding:1,rel:0,playsinline:1,fs:0,disablekb:1,iv_load_policy:3},events:{
onReady:function(e){e.target.playVideo();send({type:'ready',d:e.target.getDuration()})},
onStateChange:function(e){if(e.data===0)send({type:'ended'})}}})}
setInterval(function(){if(player&&player.getCurrentTime){var d=player.getDuration()||0,t=player.getCurrentTime()||0;if(d>0)send({type:'time',t:t,d:d})}},200);
function handle(ev){var d=ev.data;if(typeof d!=='string')return;if(d==='pause'&&player&&player.pauseVideo)player.pauseVideo();else if(d==='play'&&player&&player.playVideo)player.playVideo()}
document.addEventListener('message',handle);window.addEventListener('message',handle);
</script></body></html>`;
}

function YouTubeStory({ videoId, paused, onProgress, onComplete }: MediaProps & { videoId: string }) {
  const html = youtubeHtml(videoId);
  const webRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  function onMsg(raw: string) {
    try {
      const m = JSON.parse(raw);
      if (m.type === 'time' && m.d > 0) onProgress(Math.min(1, m.t / m.d));
      else if (m.type === 'ended') onComplete();
    } catch {
      /* ignore non-JSON (YouTube's own messages) */
    }
  }

  // Web: listen for window messages from the iframe; control via postMessage.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: MessageEvent) => typeof e.data === 'string' && onMsg(e.data);
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cmd = paused ? 'pause' : 'play';
    if (Platform.OS === 'web') iframeRef.current?.contentWindow?.postMessage(cmd, '*');
    else webRef.current?.injectJavaScript(`player&&player.${paused ? 'pauseVideo' : 'playVideo'}();true;`);
  }, [paused]);

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      ref: iframeRef,
      srcDoc: html,
      style: { width: '100%', height: '100%', border: 0 },
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
    });
  }

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html }}
      style={styles.fill}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(e) => onMsg(e.nativeEvent.data)}
    />
  );
}

/* ── Non-YouTube embeds (e.g. Instagram) — timed ──────────────────── */
function PlainEmbed({ highlight, paused, onProgress, onComplete }: MediaProps) {
  useTimedProgress(paused, EMBED_MS, onProgress, onComplete);
  const uri = toEmbedUrl(highlight.mediaUrl);
  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src: uri,
      style: { width: '100%', height: '100%', border: 0 },
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
      allowFullScreen: true,
    });
  }
  return (
    <WebView
      source={{ uri }}
      style={styles.fill}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

/* ── Cover image fallback — timed ─────────────────────────────────── */
function Cover({ highlight, paused, onProgress, onComplete }: MediaProps) {
  useTimedProgress(paused, IMAGE_MS, onProgress, onComplete);
  const cover = resolveProductImage(highlight.thumbnail);
  return (
    <View style={styles.fill}>
      {cover ? <Image source={{ uri: cover }} style={styles.fill} contentFit="cover" /> : null}
    </View>
  );
}

function useTimedProgress(
  paused: boolean,
  duration: number,
  onProgress: (p: number) => void,
  onComplete: () => void,
) {
  useEffect(() => {
    if (paused) return;
    const startT = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - startT) / duration);
      onProgress(p);
      if (p >= 1) {
        clearInterval(id);
        onComplete();
      }
    }, 50);
    return () => clearInterval(id);
  }, [paused, duration, onProgress, onComplete]);
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
});
