export interface GateRecord {
  id: string;
  name: string;
  lokasi: string;
  latitude: string;
  longitude: string;
}

export interface GateData {
  name: string;
  latitude: string;
  longitude: string;
  tanggal: string;
  tinggi: string;
  tinggiSebelumnya: string;
  status: string;
  siaga1: string;
  siaga2: string;
  siaga3: string;
}

export interface MonitorState {
  status: string;
}
