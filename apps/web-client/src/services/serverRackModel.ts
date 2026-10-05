export interface IFaceInfo {
  three_idx: number;
  mc_face: string;
  texture: string;
  uv: [number, number, number, number];
  rotation: number;
}

export interface ICubePrecise {
  name: string;
  size: [number, number, number];
  position: [number, number, number];
  faces: IFaceInfo[];
}

let rackModelPromise: Promise<ICubePrecise[]> | null = null;

export function loadRackModel(): Promise<ICubePrecise[]> {
  rackModelPromise ??= fetch('/models/server_rack_precise.json').then((res) => {
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    return res.json();
  });
  return rackModelPromise;
}
