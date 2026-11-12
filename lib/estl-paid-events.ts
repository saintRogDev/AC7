import "server-only"
import { z } from "zod"
import { createPaidEventsPublicAdapter, createPaidEventsAdminAdapter } from "@east-saint/events-client/paid"
import type { EstlResult } from "@east-saint/events-client"
import { estlEventsRequest } from "./estl-events"

export const publicPaidOperations = new Set(['getOffering','requestVerification','createPurchase','startCheckout','getPurchase','requestRecovery','recoverPurchase','getTicket','cancelPurchase'])
const invalid = {error:{code:'VALIDATION',message:'Check the event request and try again.'}} as const
const scope = z.object({eventId:z.string().uuid(),purchaseId:z.string().uuid().optional(),body:z.unknown()}).strict()

export async function paidPublicRequest(operation: string, input: unknown, sourceIp?: string): Promise<EstlResult<unknown>> {
  const parsed=scope.safeParse(input)
  if(!publicPaidOperations.has(operation)||!parsed.success)return invalid
  if(['requestVerification','requestRecovery'].includes(operation)&&!sourceIp)return {error:{code:'UNAVAILABLE',message:'Events are temporarily unavailable. Try again shortly.'}}
  const adapter=createPaidEventsPublicAdapter(request=>estlEventsRequest({...request,sourceIp}))
  return (adapter[operation as keyof typeof adapter] as (value:typeof parsed.data)=>Promise<EstlResult<unknown>>)(parsed.data)
}
export async function configureTicketOffering(token: string, input: unknown): Promise<EstlResult<unknown>> {
  const parsed=scope.safeParse(input)
  if(!parsed.success)return invalid
  return createPaidEventsAdminAdapter(request=>estlEventsRequest({...request,token})).configureOffering(parsed.data as Parameters<ReturnType<typeof createPaidEventsAdminAdapter>['configureOffering']>[0])
}
export async function readTicketManagement(token:string,eventId:string,kind:'offering'|'sales',cursor:string|null=null):Promise<EstlResult<unknown>> {
  if(!z.string().uuid().safeParse(eventId).success||(cursor&&!z.string().uuid().safeParse(cursor).success))return invalid
  return estlEventsRequest({path:`/v1/admin/events/${eventId}/${kind==='offering'?'ticket-offering':'purchases'}${cursor?`?cursor=${encodeURIComponent(cursor)}`:''}`,token})
}
