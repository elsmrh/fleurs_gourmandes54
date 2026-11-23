export function calculateBookingTotal(booking: {
  prestationPrice: number
  quantity: number
  supplements?: any
  discountAmount?: number | null
}): number {
  const mainTotal = booking.prestationPrice * booking.quantity
  let supplementsTotal = 0
  try {
    const supps = typeof booking.supplements === 'string' ? JSON.parse(booking.supplements) : booking.supplements
    if (Array.isArray(supps)) {
      supplementsTotal = supps.reduce((acc: number, s: any) => acc + (Number(s.price) || 0), 0)
    }
  } catch (e) {}
  return mainTotal + supplementsTotal - (booking.discountAmount || 0)
}
