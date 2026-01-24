<?php

namespace App\Http\Controllers;

use App\Dto\ProxyRequestDto;
use App\Services\HttpProxyService;
use Illuminate\Http\JsonResponse;

class ProxyController extends Controller
{
    public function __construct(private readonly HttpProxyService $httpProxyService) {}

    public function __invoke(ProxyRequestDto $requestDto): JsonResponse
    {
        return response()->json($this->httpProxyService->forward($requestDto));
    }
}
