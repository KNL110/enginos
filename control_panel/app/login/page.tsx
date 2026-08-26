import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { LoginView } from "./login-view";

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-svh flex-1 items-center justify-center bg-background">
					<Spinner className="size-5 text-muted-foreground" />
				</div>
			}
		>
			<LoginView />
		</Suspense>
	);
}
