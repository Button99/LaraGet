<?php

namespace App\Dto;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;

class ProxyResponseDto extends Data
{

    /**
     * @param bool $success
     * @param int $status
     * @param string|null $statusText
     * @param array $headers
     * @param string|null $body
     * @param int $size
     * @param int $duration
     * @param DataCollection $cookies
     */
    public function __construct(
        #[Required, BooleanType]
        public readonly bool $success,
        #[Required, IntegerType]
        public readonly int $status,
        #[Nullable]
        public readonly ?string $statusText,
        #[Required, ArrayType]
        public readonly array $headers,
        #[Nullable]
        public readonly ?string $body,
        #[Required, IntegerType, Min(0)]
        public readonly int $size,
        #[Required, IntegerType, Min(0)]
        public readonly int $duration,
        #[DataCollectionOf(CookieDto::class), Nullable]
        public readonly DataCollection $cookies,
    ) {}
}
