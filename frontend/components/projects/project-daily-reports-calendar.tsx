'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarDays, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { DailyReport, ProjectMember } from '@/lib/types';
import { dailyReportApi } from '@/lib/api/endpoints';

function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function ReportListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={String(i)} className="rounded-lg border p-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ProjectDailyReportsCalendar(props: {
  projectId: string;
  members: ProjectMember[];
}) {
  const [month, setMonth] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<DailyReport[]>([]);

  const fetchReports = useCallback(
    async (input: { month: Date; range?: DateRange; memberId?: string }) => {
      const resolvedFrom = input.range?.from ?? startOfMonth(input.month);
      const resolvedTo = input.range?.to ?? endOfMonth(input.month);

      setIsLoading(true);
      try {
        const res = await dailyReportApi.getAll({
          projectId: props.projectId,
          employeeId: input.memberId,
          from: toISODate(resolvedFrom),
          to: toISODate(resolvedTo),
          page: 1,
          size: 100,
        });
        setReports(res.items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không tải được daily report');
      } finally {
        setIsLoading(false);
      }
    },
    [props.projectId],
  );

  useEffect(() => {
    void fetchReports({
      month,
      range,
      memberId: selectedMemberId === 'all' ? undefined : selectedMemberId,
    });
  }, [fetchReports, month, range, selectedMemberId]);

  const reportsByDay = useMemo(() => {
    const map = new Map<string, DailyReport[]>();
    for (const r of reports) {
      const key = toISODate(new Date(r.reportDate));
      const existing = map.get(key);
      if (existing) existing.push(r);
      else map.set(key, [r]);
    }
    return map;
  }, [reports]);

  const daysWithReports = useMemo(() => {
    const out: Date[] = [];
    for (const key of reportsByDay.keys()) out.push(new Date(key));
    return out;
  }, [reportsByDay]);

  const selectedDayKey = selectedDay ? toISODate(selectedDay) : undefined;
  const selectedDayReports = useMemo(() => {
    if (!selectedDayKey) return [];
    return reportsByDay.get(selectedDayKey) ?? [];
  }, [reportsByDay, selectedDayKey]);

  const totalInView = reports.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn thành viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thành viên</SelectItem>
              {props.members
                .filter((m) => Boolean(m.employeeId))
                .map((m) => (
                  <SelectItem key={m.employeeId} value={m.employeeId}>
                    {m.employee?.fullName || m.employeeId}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm">
              <Clock className="mr-1 size-3" />
              {totalInView} báo cáo
            </Badge>
            {range?.from && range?.to ? (
              <Badge variant="secondary" className="font-mono text-xs">
                {toISODate(range.from)} → {toISODate(range.to)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-mono text-xs">
                {format(month, 'MM/yyyy')}
              </Badge>
            )}
          </div>

          <Calendar
            mode="range"
            month={month}
            onMonthChange={setMonth}
            selected={range}
            onSelect={(next) => {
              setRange(next);
              if (next?.from && !next.to) setSelectedDay(next.from);
              if (next?.from && next.to) setSelectedDay(undefined);
              if (!next?.from) setSelectedDay(undefined);
            }}
            modifiers={{
              hasReport: daysWithReports,
              selectedDay: selectedDay ? [selectedDay] : [],
            }}
            modifiersClassNames={{
              hasReport:
                'after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary',
              selectedDay: 'ring-2 ring-primary/60 rounded-md',
            }}
            onDayClick={(day) => {
              setSelectedDay((prev) => (prev && isSameDay(prev, day) ? undefined : day));
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Daily report
            {selectedDay ? (
              <Badge variant="outline" className="ml-2 font-mono text-xs">
                {toISODate(selectedDay)}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ReportListSkeleton />
          ) : selectedDay && selectedDayReports.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Không có báo cáo</EmptyTitle>
                <EmptyDescription>Ngày này chưa có daily report</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : !selectedDay ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDays className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chọn ngày để xem</EmptyTitle>
                <EmptyDescription>
                  Click một ngày trên calendar để xem danh sách report
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {selectedDayReports.map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{r.employee?.fullName || r.employeeId}</div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {r.task}
                    </Badge>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {r.workContent}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
