<?php

namespace App\Http\Controllers;

use App\Dto\ProxyRequestDto;
use App\Services\HttpProxyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProxyController extends Controller
{
    public function __construct(private HttpProxyService $httpProxyService)
    {}

    public function __invoke(ProxyRequestDto $requestDto): JsonResponse {
        return response()->json($this->httpProxyService->forward($requestDto));
    }
}
