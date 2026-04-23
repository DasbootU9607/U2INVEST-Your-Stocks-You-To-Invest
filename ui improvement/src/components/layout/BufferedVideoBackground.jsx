export function BufferedVideoBackground({
  activeSlot,
  handleVideoAdvance,
  handleVideoError,
  handleVideoReady,
  setVideoNode,
  videoSlots,
}) {
  return videoSlots.map((slot, slotIndex) => {
    if (!slot.src) {
      return null;
    }

    const isActive = slotIndex === activeSlot;

    return (
      <video
        key={slot.key}
        ref={(node) => setVideoNode(slotIndex, node)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        src={slot.src}
        muted
        playsInline
        autoPlay={isActive}
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        onCanPlay={() => handleVideoReady(slotIndex)}
        onLoadedData={() => handleVideoReady(slotIndex)}
        onEnded={() => handleVideoAdvance(slotIndex)}
        onError={() => handleVideoError(slotIndex)}
      />
    );
  });
}
