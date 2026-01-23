export function TaskTableHeader() {
  return (
    <div className="sticky top-0 bg-gray-50/80 backdrop-blur rounded-t-xl border-b border-gray-100 px-4 py-3">
      <div className="flex items-center">
        <div className="flex-1 text-xs uppercase text-gray-500 font-medium tracking-wide">
          Task
        </div>
        <div className="w-28 text-xs uppercase text-gray-500 font-medium tracking-wide text-center">
          Estimated
        </div>
        <div className="w-28 text-xs uppercase text-gray-500 font-medium tracking-wide text-center">
          Consumed
        </div>
        <div className="w-24 text-xs uppercase text-gray-500 font-medium tracking-wide text-center">
          Status
        </div>
      </div>
    </div>
  );
}
