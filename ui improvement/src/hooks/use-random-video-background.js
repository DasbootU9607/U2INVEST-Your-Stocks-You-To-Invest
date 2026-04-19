import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    let ignore = false;

    async function loadVideos() {
      try {
        const response = await fetch(listEndpoint);
        if (!response.ok) {
          throw new Error("Failed to load videos");
        }

        const payload = await response.json();
        if (!ignore) {
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
  }, [listEndpoint]);

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
    currentVideoUrl: currentVideo ? `${mediaBasePath}/${encodeURIComponent(currentVideo)}` : "",
    handleVideoAdvance: advanceVideo,
  };
}
