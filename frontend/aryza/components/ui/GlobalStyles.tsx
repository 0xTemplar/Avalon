import React from 'react';

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes rotate {
        from {
          transform: translate(-50%, -50%) rotate(45deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(405deg);
        }
      }
      @keyframes morph {
        0%,
        100% {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
        }
        50% {
          border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
        }
      }
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-33.33%);
        }
      }
      @keyframes fadeIn {
        to {
          opacity: 1;
        }
      }
      @keyframes float {
        0%,
        100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }

      /* Hide scrollbar but keep functionality */
      *::-webkit-scrollbar {
        display: none;
      }
      * {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      /* Mobile touch interactions */
      @media (max-width: 768px) {
        button,
        a,
        input,
        select,
        textarea {
          -webkit-tap-highlight-color: transparent;
        }
      }

      /* Etherlink badge hover effects */
      a:hover .etherlink-shine {
        transform: rotate(45deg) translateX(100%) !important;
      }

      a:hover .etherlink-text {
        color: #00ff88 !important;
      }

      a:hover .etherlink-logo {
        filter: brightness(1) drop-shadow(0 0 10px rgba(0, 255, 136, 0.5)) !important;
      }

      @keyframes etherlink-pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
    `}</style>
  );
}
