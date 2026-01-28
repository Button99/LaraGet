<?php

namespace App\Services;

use App\Dto\ProxyRequestDto;
use App\Dto\ProxyResponseDto;
use App\Dto\ProxyResponseErrorDto;
use Illuminate\Support\Facades\Http;

class HttpProxyService
{
    public function forward(ProxyRequestDto $dto): ProxyResponseDto|ProxyResponseErrorDto
    {
        $start = microtime(true);
        try {
            $response = Http::withHeaders($dto->headers ?? [])
                ->timeout(60)
                ->send($dto->method, $dto->url, [
                    'body' => $dto->body,
                ]);

            $final = microtime(true) - $start;

            // Convert cookies to array
            $cookies = [];
            foreach ($response->cookies() as $cookie) {
                $cookies[] = [
                    'name' => $cookie->getName(),
                    'value' => $cookie->getValue(),
                    'domain' => $cookie->getDomain(),
                    'path' => $cookie->getPath(),
                    'expires' => $cookie->getExpires(),
                    'secure' => $cookie->getSecure(),
                    'httpOnly' => $cookie->getHttpOnly(),
                ];
            }

            return ProxyResponseDto::from([
                'success' => true,
                'status' => $response->status(),
                'statusText' => $response->reason(),
                'headers' => $response->headers(),
                'body' => $response->body(),
                'size' => strlen($response->body()),
                'duration' => $final,
                'cookies' => $cookies,
            ]);
        } catch (\Exception $e) {
            $final = microtime(true) - $start;

            return ProxyResponseErrorDto::from([
                'success' => false,
                'status' => $e->getCode(),
                'message' => $e->getMessage(),
                'duration' => (int) round($final * 1000),
            ]);
        }
    }
}
