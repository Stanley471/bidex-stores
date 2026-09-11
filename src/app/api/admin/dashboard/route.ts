import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAdmin } from '@/lib/auth/authorization'
import { dashboardService, type DateRangePeriod } from '@/services/dashboard.service'

export async function GET(request: Request) {
  const token = getAuthCookie(await cookies())

  try {
    await requireAdmin(token)
  } catch (error) {
    const status = error instanceof Error && error.message.includes('Authentication') ? 401 : 403
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unauthorized.' },
      { status },
    )
  }

  try {
    const url = new URL(request.url)
    const rangeParam = (url.searchParams.get('range') || 'month') as DateRangePeriod
    const validRanges: DateRangePeriod[] = ['today', 'week', 'month', 'all_time']
    const range = validRanges.includes(rangeParam) ? rangeParam : 'month'

    const stats = await dashboardService.getDashboardStats(range)

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch dashboard stats.' },
      { status: 500 },
    )
  }
}
