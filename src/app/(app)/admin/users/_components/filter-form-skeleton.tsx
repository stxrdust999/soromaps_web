export const FIELD_KEYS = ["name", "email", "neighborhood", "createdAt"];

export function UserListFilterFormSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {FIELD_KEYS.map((key) => (
        <div key={key} className="space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
