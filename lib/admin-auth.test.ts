import { beforeEach, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({ createClient: vi.fn(), getUser: vi.fn(), roles: [] as unknown[] }))
vi.mock("react", () => ({ cache: (fn: unknown) => fn }))
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`) } }))
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }))
import { requireAc7Staff } from "./admin-auth"
import { resolveAc7AdminOrgSlug } from "./admin-environment"
beforeEach(() => {
 mocks.roles = []; mocks.getUser.mockResolvedValue({ data: { user: { id: "staff", email: "staff@example.test" } }, error: null })
 mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser }, from: (name: string) => ({ select: () => ({ eq: () => name === "profiles" ? { maybeSingle: async () => ({ data: { name: "Staff" } }) } : Promise.resolve({ data: mocks.roles }) }) }) })
})
it("pins all nonproduction deployments to sandbox", () => { expect(resolveAc7AdminOrgSlug("production")).toBe("ac7"); for(const env of [undefined,"preview","development"]) expect(resolveAc7AdminOrgSlug(env)).toBe("ac7-sandbox") })
it("rejects production-only and other tenant memberships in Preview", async () => { mocks.roles = [{org_id:"id",role:"admin",organizations:{slug:"ac7"}},{org_id:"id2",role:"admin",organizations:{slug:"mdi-sandbox"}}]; await expect(requireAc7Staff()).rejects.toThrow("unauthorized") })
it("accepts the sandbox membership after getUser verification", async () => { mocks.roles = [{org_id:"id",role:"admin",organizations:{slug:"ac7-sandbox"}}]; expect(await requireAc7Staff()).toMatchObject({userId:"staff",orgSlug:"ac7-sandbox",role:"admin"}) })
it("rejects unverifiable users before membership access", async () => { mocks.getUser.mockResolvedValue({data:{user:null},error:{message:"invalid"}}); await expect(requireAc7Staff()).rejects.toThrow("redirect:/login") })
