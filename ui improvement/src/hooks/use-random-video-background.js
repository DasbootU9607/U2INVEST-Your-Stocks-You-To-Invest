import { useEffect, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const BASE_URL = import.meta.env.BASE_URL || "/";
const IS_GITHUB_PAGES =
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
const USE_STATIC_MEDIA = IS_GITHUB_PAGES && !API_BASE;

function shuffleList(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function buildVideoRound(items, previousLastVideo = null) {
  const shuffled = shuffleList(items);

  if (previousLastVideo && shuffled.length > 1 && shuffled[0] === previousLastVideo) {
    const nextIndex = shuffled.findIndex((videoName) => videoName !== previousLastVideo);
    [shuffled[0], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[0]];
  }

  return shuffled;
}

function trimLeadingSlashes(value) {
  return String(value || "").replace(/^\/+/, "");
}

function joinAppPath(path) {
  const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${normalizedBase}${trimLeadingSlashes(path)}`;
}

function joinBackendPath(path) {
  if (!path) {
    return "";
  }

  return API_BASE ? `${API_BASE}${path}` : path;
}

export function useRandomVideoBackground({
  listEndpoint,
  mediaBasePath,
  activeThreshold = 0.55,
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const playlistRef = useRef([]);
  const playlistIndexRef = useRef(0);
  const videosRef = useRef([]);

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mediaSource, setMediaSource] = useState("backend");

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    let ignore = false;

    async function loadVideos() {
      const staticListUrl = joinAppPath(`${trimLeadingSlashes(mediaBasePath)}/index.json`);

      try {
        const tryStatic = async () => {
          const staticResponse = await fetch(staticListUrl);
          if (!staticResponse.ok) {
            throw new Error("Failed to load static videos");
          }

          const staticPayload = await staticResponse.json();
          if (!ignore) {
            setMediaSource("static");
            setVideos(Array.isArray(staticPayload.videos) ? staticPayload.videos : []);
          }
        };

        if (USE_STATIC_MEDIA) {
          await tryStatic();
          return;
        }

        const response = await fetch(joinBackendPath(listEndpoint));
        if (!response.ok) {
          await tryStatic();
          return;
        }

        const payload = await response.json();
        if (!ignore) {
          setMediaSource("backend");
          setVideos(Array.isArray(payload.videos) ? payload.videos : []);
        }
      } catch (error) {
        console.error("Video background load error:", error);
        if (!ignore) {
          setVideos([]);
        }
      }
    }

    loadVideos();

    return () => {
      ignore = true;
    };
  }, [listEndpoint, mediaBasePath]);

  useEffect(() => {
    if (!videos.length) {
      playlistRef.current = [];
      playlistIndexRef.current = 0;
      setCurrentVideo("");
      return;
    }

    const nextRound = buildVideoRound(videos);
    playlistRef.current = nextRound;
    playlistIndexRef.current = 0;
    setCurrentVideo(nextRound[0]);
  }, [videos]);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting && entry.intersectionRatio >= activeThreshold);
      },
      { threshold: [0, 0.2, activeThreshold, 0.85] }
    );

    observer.observe(sectionNode);

    return () => {
      observer.disconnect();
    };
  }, [activeThreshold]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) {
      return undefined;
    }

    if (!currentVideo || !isActive) {
      videoNode.pause();
      return undefined;
    }

    const playPromise = videoNode.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }

    return () => {
      videoNode.pause();
    };
  }, [currentVideo, isActive]);

  const advanceVideo = () => {
    const currentRound = playlistRef.current;
    if (!currentRound.length) {
      return;
    }

    const nextIndex = playlistIndexRef.current + 1;
    if (nextIndex < currentRound.length) {
      playlistIndexRef.current = nextIndex;
      setCurrentVideo(currentRound[nextIndex]);
      return;
    }

    const nextRound = buildVideoRound(videosRef.current, currentRound[currentRound.length - 1]);
    playlistRef.current = nextRound;
    playlistIndexRef.current = 0;
    setCurrentVideo(nextRound[0] || "");
  };

  return {
    sectionRef,
    videoRef,
    videoCount: videos.length,
    currentVideoUrl: currentVideo
      ? mediaSource === "static"
        ? joinAppPath(`${trimLeadingSlashes(mediaBasePath)}/${encodeURIComponent(currentVideo)}`)
        : joinBackendPath(`${mediaBasePath}/${encodeURIComponent(currentVideo)}`)
      : "",
    handleVideoAdvance: advanceVideo,
  };
}
