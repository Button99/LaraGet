<?php

namespace App\Dto;

use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

class CookieDto extends Data
{
    public function __construct(
        #[Required, StringType]
        public readonly string $name,
        #[Required, StringType]
        public readonly string $value,
        #[Nullable, StringType]
        public readonly ?string $domain = null,
        #[Nullable, StringType]
        public readonly ?string $path = null,
        #[Nullable, IntegerType]
        public readonly ?int $expires = null,
        #[Required, BooleanType]
        public readonly bool $secure = false,
        #[Required, BooleanType]
        public readonly bool $httpOnly = false,
    ) {}
}
