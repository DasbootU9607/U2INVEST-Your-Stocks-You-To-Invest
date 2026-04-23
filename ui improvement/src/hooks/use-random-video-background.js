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

function buildVideoUrl(videoName, mediaSource, mediaBasePath) {
  if (!videoName) {
    return "";
  }

  const encodedVideoName = encodeURIComponent(videoName);

  return mediaSource === "static"
    ? joinAppPath(`${trimLeadingSlashes(mediaBasePath)}/${encodedVideoName}`)
    : joinBackendPath(`${mediaBasePath}/${encodedVideoName}`);
}

function createVideoSlot(slotIndex, token, videoName, mediaSource, mediaBasePath) {
  return {
    key: `${slotIndex}-${token}`,
    name: videoName,
    src: buildVideoUrl(videoName, mediaSource, mediaBasePath),
  };
}

function createEmptyVideoSlots(mediaSource, mediaBasePath) {
  return [
    createVideoSlot(0, 0, "", mediaSource, mediaBasePath),
    createVideoSlot(1, 0, "", mediaSource, mediaBasePath),
  ];
}

function getAlternateSlotIndex(slotIndex) {
  return slotIndex === 0 ? 1 : 0;
}

export function useRandomVideoBackground({
  listEndpoint,
  mediaBasePath,
  staticListPath,
  staticMediaBasePath,
  activeThreshold = 0.55,
}) {
  const sectionRef = useRef(null);
  const videoNodesRef = useRef([null, null]);
  const queueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const slotReadyRef = useRef([false, false]);
  const slotTokenRef = useRef([0, 0]);
  const lastServedVideoRef = useRef(null);
  const videosRef = useRef([]);
  const mediaSourceRef = useRef("backend");
  const isActiveRef = useRef(true);
  const activeSlotRef = useRef(0);
  const videoSlotsRef = useRef(createEmptyVideoSlots("backend", mediaBasePath));

  const [videos, setVideos] = useState([]);
  const [videoSlots, setVideoSlots] = useState(() =>
    createEmptyVideoSlots("backend", mediaBasePath)
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [mediaSource, setMediaSource] = useState("backend");

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    mediaSourceRef.current = mediaSource;
  }, [mediaSource]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    activeSlotRef.current = activeSlot;
  }, [activeSlot]);

  useEffect(() => {
    videoSlotsRef.current = videoSlots;
  }, [videoSlots]);

  useEffect(() => {
    let ignore = false;

    async function loadVideos() {
      const staticListUrl = staticListPath ? joinAppPath(staticListPath) : "";

      try {
        const tryStatic = async () => {
          if (!staticListUrl || !staticMediaBasePath) {
            throw new Error("Static video manifest is not configured");
          }

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

        try {
          await tryStatic();
          return;
        } catch (staticError) {
          const response = await fetch(joinBackendPath(listEndpoint));
          if (!response.ok) {
            throw staticError;
          }

          const payload = await response.json();
          if (!ignore) {
            setMediaSource("backend");
            setVideos(Array.isArray(payload.videos) ? payload.videos : []);
          }
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

  function takeNextVideoName() {
    if (!videosRef.current.length) {
      return "";
    }

    if (!queueRef.current.length || queueIndexRef.current >= queueRef.current.length) {
      queueRef.current = buildVideoRound(videosRef.current, lastServedVideoRef.current);
      queueIndexRef.current = 0;
    }

    const nextVideoName = queueRef.current[queueIndexRef.current] || "";
    queueIndexRef.current += 1;

    if (nextVideoName) {
      lastServedVideoRef.current = nextVideoName;
    }

    return nextVideoName;
  }

  function updateVideoSlots(producer) {
    setVideoSlots((currentSlots) => {
      const nextSlots =
        typeof producer === "function" ? producer(currentSlots) : producer;
      videoSlotsRef.current = nextSlots;
      return nextSlots;
    });
  }

  function buildSlot(slotIndex, videoName) {
    slotTokenRef.current[slotIndex] += 1;

    return createVideoSlot(
      slotIndex,
      slotTokenRef.current[slotIndex],
      videoName,
      mediaSourceRef.current,
      mediaSourceRef.current === "static" && staticMediaBasePath
        ? staticMediaBasePath
        : mediaBasePath
    );
  }

  function assignSlotVideo(slotIndex, videoName) {
    slotReadyRef.current[slotIndex] = false;

    updateVideoSlots((currentSlots) => {
      const nextSlots = [...currentSlots];
      nextSlots[slotIndex] = buildSlot(slotIndex, videoName);
      return nextSlots;
    });
  }

  function refillSlot(slotIndex) {
    assignSlotVideo(slotIndex, takeNextVideoName());
  }

  function playSlot(slotIndex) {
    const videoNode = videoNodesRef.current[slotIndex];

    if (!videoNode || !videoSlotsRef.current[slotIndex]?.src) {
      return;
    }

    const playPromise = videoNode.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  }

  useEffect(() => {
    if (!videos.length) {
      queueRef.current = [];
      queueIndexRef.current = 0;
      lastServedVideoRef.current = null;
      slotTokenRef.current = [0, 0];
      slotReadyRef.current = [false, false];
      activeSlotRef.current = 0;
      setActiveSlot(0);
      const emptySlots = createEmptyVideoSlots(mediaSource, mediaBasePath);
      videoSlotsRef.current = emptySlots;
      setVideoSlots(emptySlots);
      return;
    }

    queueRef.current = [];
    queueIndexRef.current = 0;
    lastServedVideoRef.current = null;
    slotReadyRef.current = [false, false];
    activeSlotRef.current = 0;
    setActiveSlot(0);

    const initialVideos = videos.slice(0, 2);
    const remainingVideos = videos.slice(initialVideos.length);

    queueRef.current = buildVideoRound(remainingVideos, initialVideos.at(-1) || null);
    queueIndexRef.current = 0;
    lastServedVideoRef.current = initialVideos.at(-1) || null;

    const initialSlots = [
      buildSlot(0, initialVideos[0] || ""),
      buildSlot(1, initialVideos[1] || initialVideos[0] || ""),
    ];
    videoSlotsRef.current = initialSlots;
    setVideoSlots(initialSlots);
  }, [videos, mediaSource, mediaBasePath, staticMediaBasePath]);

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
    videoNodesRef.current.forEach((videoNode, slotIndex) => {
      if (!videoNode) {
        return;
      }

      if (slotIndex !== activeSlot || !isActive || !videoSlots[slotIndex]?.src) {
        videoNode.pause();
        return;
      }

      playSlot(slotIndex);
    });
  }, [activeSlot, isActive, videoSlots]);

  const handleVideoAdvance = (slotIndex) => {
    if (slotIndex !== activeSlotRef.current) {
      return;
    }

    const nextSlotIndex = getAlternateSlotIndex(slotIndex);
    const nextVideoNode = videoNodesRef.current[nextSlotIndex];
    const previousVideoNode = videoNodesRef.current[slotIndex];

    previousVideoNode?.pause();

    if (nextVideoNode) {
      nextVideoNode.currentTime = 0;
    }

    activeSlotRef.current = nextSlotIndex;
    setActiveSlot(nextSlotIndex);

    if (isActiveRef.current) {
      playSlot(nextSlotIndex);
    }

    refillSlot(slotIndex);
  };

  const handleVideoReady = (slotIndex) => {
    slotReadyRef.current[slotIndex] = true;

    if (slotIndex === activeSlotRef.current && isActiveRef.current) {
      playSlot(slotIndex);
    }
  };

  const handleVideoError = (slotIndex) => {
    slotReadyRef.current[slotIndex] = false;

    if (slotIndex === activeSlotRef.current) {
      handleVideoAdvance(slotIndex);
      return;
    }

    refillSlot(slotIndex);
  };

  const setVideoNode = (slotIndex, node) => {
    videoNodesRef.current[slotIndex] = node;
  };

  return {
    activeSlot,
    handleVideoAdvance,
    handleVideoError,
    handleVideoReady,
    sectionRef,
    setVideoNode,
    videoCount: videos.length,
    videoSlots,
  };
}
