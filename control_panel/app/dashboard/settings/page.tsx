import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { SettingsView } from "./settings-view";

export default function SettingsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-1 items-center justify-center px-6 py-16">
                    <Spinner className="size-5 text-muted-foreground" />
                </div>
            }
        >
            <SettingsView />
        </Suspense>
    );
}
