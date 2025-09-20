/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Team } from '@/payload-types'

export type ServiceDeps = {
  payload: {
    find: Function
    sendEmail: Function
  }
  consumeBalance: (args: { team: Team; charge: number }) => Promise<{ error?: string }>
  checkforSpam: (fields: Array<{ name: string; value: string }>) => Promise<boolean>
  utils: {
    checkQueryParams: (
      params: Record<string, unknown>,
      requiredParams: string[],
    ) => { success: boolean; message: string }
    customResponse: (
      status: number,
      body: { message: string; success: boolean },
      logMessage?: string,
    ) => Response
    successResponse: (
      isHtmlForm: boolean,
      redirect: string,
      message: string,
      logMessage?: string,
    ) => Response
    extractFormData: (fd: FormData) => Array<{ name: string; value: string }>
    withCORS: (res: Response) => Response
  }
  config: {
    HONEYPOTS: string[]
    MAX_FIELDS: number
    MAX_FIELD_LEN: number
    MAX_BYTES: number
  }
}
