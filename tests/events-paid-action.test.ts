import { test } from "vitest"
import assert from "node:assert/strict"
import { paidEventAction } from "../app/events/actions"

test("direct new-sale actions respect the paid switch even while public Events is enabled", async () => {
 const oldPublic=process.env.ESTL_EVENTS_PUBLIC_ENABLED, oldPaid=process.env.ESTL_EVENTS_PAID_UI_ENABLED
 try {
  process.env.ESTL_EVENTS_PUBLIC_ENABLED="true"
  for(const value of [undefined, "false", "TRUE"]){
   if(value===undefined)delete process.env.ESTL_EVENTS_PAID_UI_ENABLED;else process.env.ESTL_EVENTS_PAID_UI_ENABLED=value
   for(const operation of ["requestVerification","createPurchase"]){
    assert.deepEqual(await paidEventAction(operation,{}),{error:{code:"EVENT_NOT_FOUND",message:"That event is unavailable."}})
   }
  }
 } finally {
  if(oldPublic===undefined)delete process.env.ESTL_EVENTS_PUBLIC_ENABLED;else process.env.ESTL_EVENTS_PUBLIC_ENABLED=oldPublic
  if(oldPaid===undefined)delete process.env.ESTL_EVENTS_PAID_UI_ENABLED;else process.env.ESTL_EVENTS_PAID_UI_ENABLED=oldPaid
 }
})
