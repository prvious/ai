# App/Actions guidelines

- This application uses the Action pattern and prefers for much logic to live in reusable and composable Action classes.
- Actions live in `app/Actions`, they are named based on what they do, with no suffix.
- Actions are used for code that mutates our own database - creating, updating, or deleting records in the application's database.
- Actions will be called from many different places: jobs, commands, HTTP requests, API requests, MCP requests, and more.
- Create dedicated Action classes for business logic with a single entry-point method named `handle()`.
- Keep the Action's main workflow visible in `handle()` so it can usually be understood without jumping between methods.
- Do not extract private helper methods merely to shorten `handle()` or because the code can be extracted.
- A private helper method is acceptable only when it encapsulates a cohesive, genuinely complex operation, materially improves the readability of `handle()`, and does not justify a standalone Action.
- If the operation represents a meaningful or reusable business operation, create a separate Action instead of a private helper method.
- Create new actions with `php artisan make:action "{name}" --no-interaction`
- Wrap complex operations in `DB::transaction()` within actions when multiple models are involved.
- For interacting with external services and APIs, use Service classes instead (see services.md).

## Namespace Organization

- Actions should be organized in appropriate namespaces based on their domain or context.
- Use meaningful namespace segments that reflect the business domain or integration type.
- Examples:
    - Stripe integration actions: `App\Actions\Stripe`
    - Invoice-related actions: `App\Actions\Invoice`
    - Payment plan actions: `App\Actions\PaymentPlan`
    - Receipt processing actions: `App\Actions\Receipt`
    - User management actions: `App\Actions\User`
- When creating actions, consider grouping related functionality together in the same namespace.

<?php

declare(strict_types=1);

namespace App\Actions\Invoice;

final readonly class CreateInvoice
{
    public function handle(User $user, string $favorite): bool
    {
        DB::transaction(function () {
            //
        });
    }
}
