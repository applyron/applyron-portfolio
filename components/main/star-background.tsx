"use client";

import {
  Points,
  PointMaterial,
  type PointsInstancesProps,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as random from "maath/random";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Points as PointsType } from "three";

const STAR_POINT_COUNT = 1667;
const STAR_FIELD_RADIUS = 1.2;

function subscribe(
  mediaQuery: MediaQueryList,
  listener: () => void,
): () => void {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export const StarBackground = (props: PointsInstancesProps) => {
  const ref = useRef<PointsType | null>(null);
  const sphere = useMemo(
    () =>
      random.inSphere(new Float32Array(STAR_POINT_COUNT * 3), {
        radius: STAR_FIELD_RADIUS,
      }) as Float32Array,
    [],
  );

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        stride={3}
        positions={sphere}
        frustumCulled
        {...props}
      >
        <PointMaterial
          transparent
          color="#fff"
          size={0.002}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export const StarsCanvas = () => (
  <StarCanvasShell />
);

const StaticStarField = () => (
  <div
    aria-hidden
    className="fixed inset-0 -z-10 overflow-hidden bg-[#030014]"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.22)_0_1px,transparent_1.4px),radial-gradient(circle_at_78%_12%,rgba(255,255,255,0.18)_0_1.1px,transparent_1.5px),radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.18)_0_1px,transparent_1.3px),radial-gradient(circle_at_64%_42%,rgba(255,255,255,0.15)_0_1px,transparent_1.3px),radial-gradient(circle_at_18%_58%,rgba(255,255,255,0.18)_0_1px,transparent_1.4px),radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.2)_0_1.2px,transparent_1.5px),radial-gradient(circle_at_44%_82%,rgba(255,255,255,0.16)_0_1px,transparent_1.4px),radial-gradient(circle_at_70%_88%,rgba(255,255,255,0.14)_0_1px,transparent_1.4px)] opacity-70" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(112,66,248,0.18),transparent_40%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.10),transparent_35%),linear-gradient(180deg,rgba(3,0,20,0.15),rgba(3,0,20,0.75))]" />
  </div>
);

const StarCanvasShell = () => {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setCanRender(!reducedMotion.matches && !coarsePointer.matches);
    };

    update();

    const unsubscribeReducedMotion = subscribe(reducedMotion, update);
    const unsubscribeCoarsePointer = subscribe(coarsePointer, update);

    return () => {
      unsubscribeReducedMotion();
      unsubscribeCoarsePointer();
    };
  }, []);

  if (!canRender) {
    return <StaticStarField />;
  }

  return (
    <div className="w-full h-auto fixed inset-0 -z-10">
      <WebGLErrorBoundary fallback={<StaticStarField />}>
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Suspense fallback={null}>
            <StarBackground />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
