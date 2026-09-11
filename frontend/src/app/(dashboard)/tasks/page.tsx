import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";

const TASKS = [
  {
    id: "t1",
    title: "Jasur bilan Istanbul taklifini yuborish",
    due: "Bugun",
    done: false,
  },
  {
    id: "t2",
    title: "Madina pasport muddatini tekshirish",
    due: "Ertaga",
    done: false,
  },
  {
    id: "t3",
    title: "Paris broniga to‘lov eslatmasi",
    due: "Bugun",
    done: true,
  },
  {
    id: "t4",
    title: "Dubai hotel quote so‘rash",
    due: "12 Sep",
    done: false,
  },
];

export default async function TasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Vazifalar" role={session.role} />
      <SectionTitle
        title="Ish ro‘yxati"
        subtitle="Employee va admin uchun umumiy follow-uplar."
      />
      <div className="grid gap-3">
        {TASKS.map((t, i) => (
          <Card
            key={t.id}
            className={`animate-fade-up flex items-center justify-between gap-4 p-4 stagger-${Math.min(i + 1, 5)}`}
          >
            <div>
              <p
                className={
                  t.done
                    ? "text-sm text-[var(--text-muted)] line-through"
                    : "text-sm font-medium"
                }
              >
                {t.title}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{t.due}</p>
            </div>
            <Badge tone={t.done ? "ok" : "warm"}>
              {t.done ? "bajarildi" : "ochiq"}
            </Badge>
          </Card>
        ))}
      </div>
    </>
  );
}
