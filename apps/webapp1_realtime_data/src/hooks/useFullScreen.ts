import { useState, useEffect, type RefObject } from "react";

export const useFullscreen = (containerRef: RefObject<HTMLElement | null>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F11") {
        event.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch((err) =>
            console.error(`Error enabling fullscreen: ${err.message}`)
          );
      }
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch((err) =>
            console.error(`Error exiting fullscreen: ${err.message}`)
          );
      }
    }
  };

  return { isFullscreen, toggleFullscreen };
};
