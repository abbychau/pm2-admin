export interface DockerContainer {
  ID: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  State: string;
  Status: string;
  Ports: string;
  Labels: { [key: string]: string };
  Mounts: Array<{
    Type: string;
    Source: string;
    Destination: string;
  }>;
}
