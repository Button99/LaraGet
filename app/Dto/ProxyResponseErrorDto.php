<?php

namespace App\Dto;

use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

class ProxyResponseErrorDto extends Data
{
    public function __construct(
        #[Required, BooleanType]
        public bool $success,
        #[Required, IntegerType]
        public int $status,
        #[Required, StringType]
        public string $message,
        #[Required, IntegerType]
        public int $duration
    ) {}
}
