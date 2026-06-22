import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'
import type {
  AnalysisProgress, GraphResponse, NodeDetailResponse,
  AnalyzeResult, JobStatus
} from '../shared/types'

const api = {
  openProjectDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC.OPEN_PROJECT_DIALOG),

  analyze: (projectPath: string): Promise<AnalyzeResult> =>
    ipcRenderer.invoke(IPC.ANALYZE, projectPath),

  getJobStatus: (jobId: string): Promise<JobStatus | null> =>
    ipcRenderer.invoke(IPC.GET_JOB_STATUS, jobId),

  getGraph: (projectId: string): Promise<GraphResponse> =>
    ipcRenderer.invoke(IPC.GET_GRAPH, projectId),

  getNodeDetail: (nodeId: string): Promise<NodeDetailResponse> =>
    ipcRenderer.invoke(IPC.GET_NODE_DETAIL, nodeId),

  onProgress: (callback: (progress: AnalysisProgress) => void): (() => void) => {
    const handler = (_event: any, progress: AnalysisProgress) => callback(progress)
    ipcRenderer.on(IPC.PROGRESS, handler)
    return () => ipcRenderer.removeListener(IPC.PROGRESS, handler)
  },

  onComplete: (callback: (data: { jobId: string; projectId: string; graph: GraphResponse }) => void): (() => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on(IPC.COMPLETE, handler)
    return () => ipcRenderer.removeListener(IPC.COMPLETE, handler)
  },

  onError: (callback: (data: { jobId: string; error: string }) => void): (() => void) => {
    const handler = (_event: any, data: any) => callback(data)
    ipcRenderer.on(IPC.ERROR, handler)
    return () => ipcRenderer.removeListener(IPC.ERROR, handler)
  }
}

contextBridge.exposeInMainWorld('projectOS', api)

export type ProjectOSApi = typeof api
