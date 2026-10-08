// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AttendeesPanel } from "../components/events-core/admin/attendees-panel"
import { EventForm } from "../components/events-core/admin/event-form"
import type { EventsAdminAdapter } from "../lib/events-core/adapter"

afterEach(cleanup)

test("staff registration retries keep the same intent key and changed guests get a new key", async () => {
  const registerGuest = vi.fn().mockResolvedValue({ error: { code: "UNAVAILABLE", message: "Try again" } })
  const adapter = { registerGuest, listAttendees: async () => ({ data: { attendees: [], next_cursor: null } }) } as unknown as EventsAdminAdapter
  render(<AttendeesPanel adapter={adapter} eventId="event" reloadKey={0} />)
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Sandbox Guest" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "guest@example.com" } })
  fireEvent.click(screen.getByRole("button", { name: "Add guest" }))
  await waitFor(() => expect(registerGuest).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(screen.getByRole("button", { name: "Add guest" }).hasAttribute("disabled")).toBe(false))
  fireEvent.click(screen.getByRole("button", { name: "Add guest" }))
  await waitFor(() => expect(registerGuest).toHaveBeenCalledTimes(2))
  expect(registerGuest.mock.calls[0][0]).toEqual(registerGuest.mock.calls[1][0])
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "other@example.com" } })
  await waitFor(() => expect(screen.getByRole("button", { name: "Add guest" }).hasAttribute("disabled")).toBe(false))
  fireEvent.click(screen.getByRole("button", { name: "Add guest" }))
  await waitFor(() => expect(registerGuest).toHaveBeenCalledTimes(3))
  expect(registerGuest.mock.calls[2][0].idempotency_key).not.toBe(registerGuest.mock.calls[0][0].idempotency_key)
})

test.each(["1.5", "0", "12people"])("invalid capacity %s never reaches the event adapter", async (capacity) => {
  const createEvent = vi.fn()
  render(<EventForm adapter={{ createEvent } as unknown as EventsAdminAdapter} onDone={() => {}} onCancel={() => {}} />)
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Sandbox event" } })
  fireEvent.change(screen.getByLabelText("Starts"), { target: { value: "2099-06-01T10:00" } })
  fireEvent.change(screen.getByLabelText("Ends"), { target: { value: "2099-06-01T11:00" } })
  fireEvent.change(screen.getByLabelText("Capacity (blank = unlimited)"), { target: { value: capacity } })
  fireEvent.click(screen.getByRole("button", { name: "Create event" }))
  expect(await screen.findByText(/Capacity must be a positive whole number/)).toBeTruthy()
  expect(createEvent).not.toHaveBeenCalled()
})
