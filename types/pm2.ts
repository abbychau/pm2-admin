export interface PM2Process {
  name: string;
  pid: number;
  pm_id: number;
  monit: {
    memory: number;
    cpu: number;
  };
  pm2_env: {
    status: string;
    pm_uptime: number;
    restart_time: number;
  };
}

export interface PM2Description extends PM2Process {
  pm2_env: PM2Process['pm2_env'] & {
    env: Record<string, string>;
    created_at: number;
    pm_cwd: string;
    exec_mode: string;
    node_version: string;
    pm_out_log_path: string;
    pm_err_log_path: string;
  };
}
