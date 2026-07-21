# App/Services guidelines

- This application uses Service classes for interacting with external services and third-party APIs.
- Services live in `app/Services`, they are named based on the service they integrate with, typically with a `Service` suffix.
- Use Service classes to encapsulate all interactions with external APIs like Stripe, payment gateways, external http apis, etc.
- Service classes should handle API authentication, request formatting, response parsing, and error handling for external services.
- Services will be called from Actions, jobs, commands, and controllers.

## Examples

- `App\Services\StripeService` - For interacting with the Stripe API
- `App\Services\GithubService` - For github integrations
- `App\Services\PaymentGatewayService` - For payment processing

## Structure

```php
<?php

declare(strict_types=1);

namespace App\Services;

final readonly class StripeService
{
    public function __construct(
        private \Stripe\StripeClient $stripe
    ) {}

    public function createCustomer(string $email, array $metadata = []): \Stripe\Customer
    {
        return $this->stripe->customers->create([
            'email' => $email,
            'metadata' => $metadata,
        ]);
    }
}
```
