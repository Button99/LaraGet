<?php

namespace App\Dto;

use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Url;
use Spatie\LaravelData\Data;

class ProxyRequestDto extends Data
{
    public function __construct(
        #[Required, In(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'])]
        public string $method,
        #[Required, Url]
        public string $url,
        #[ArrayType]
        public ?array $headers = [],
        public ?string $body
    ) {}
}
