import { useRef, useEffect, useState } from "react";
import { debounce } from "../lib/debounce";

const getVideoIdFromUrl = (url) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v");
};

const YouTubeEmbed = ({ url }) => {
  const ref = useRef();
  const videoId = getVideoIdFromUrl(url);
  const [height, updateHeight] = useState(null);

  useEffect(() => {
    if (!height) {
      updateHeight(
        ref && ref.current
          ? `${Math.round(ref.current.offsetWidth * 0.65)}px`
          : "auto"
      );
    }
    const debouncedResize = debounce(() => {
      updateHeight(
        ref && ref.current
          ? `${Math.round(ref.current.offsetWidth * 0.65)}px`
          : "auto"
      );
    }, 250);

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return (
    <div ref={ref} className="youtube-embed-wrapper">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <style jsx>{`
        .youtube-embed-wrapper {
          width: 100%;
        }
        iframe {
          width: 100%;
          height: ${height};
        }
      `}</style>
    </div>
  );
};

export default YouTubeEmbed;
