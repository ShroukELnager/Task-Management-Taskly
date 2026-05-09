import Image from "next/image";

export default function StatsCards({ data }) {
  const cards = [
    {
      title: "TOTAL TASKS",
      value: data.total_tasks,
      color: "text-slate-800",
      img: "/images/task.png",
    },
    {
      title: "COMPLETED TASKS",
      value: data.done_tasks,
      color: "text-green-600",
      img: "/images/radiocheck.svg",
    },
    {
      title: "OVERDUE TASKS",
      value: data.overdue_tasks,
      color: "text-red-600",
      img: "/images/block.png",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-sm md:flex-row md:items-center md:justify-between md:p-5 md:text-left"
        >
          <div className="order-1 rounded-xl bg-[#F1F3FF] p-3 md:order-2">
            <Image src={c.img} alt="icon" width={20} height={20} />
          </div>

          <div className="order-2 mt-3 md:order-1 md:mt-0">
            <p className="mb-1 text-xs text-gray-400 md:mb-2 md:text-sm">
              {c.title}
            </p>

            <h2 className={`text-2xl font-bold md:text-3xl ${c.color}`}>
              {c.value || 0}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
}