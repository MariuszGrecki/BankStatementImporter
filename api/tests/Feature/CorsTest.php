<?php

it('does not use a wildcard origin in the real configuration', function () {
    expect(config('cors.allowed_origins'))->not->toContain('*');
});

describe('with a configured frontend origin', function () {
    beforeEach(function () {
        config(['cors.allowed_origins' => ['http://front.test']]);
    });

    it('allows the configured frontend origin', function () {
        $this->getJson('/api/health', ['Origin' => 'http://front.test'])
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'http://front.test');
    });

    it('never echoes another origin and never answers with a wildcard', function (string $origin) {
        $response = $this->getJson('/api/health', ['Origin' => $origin])->assertOk();

        expect($response->headers->get('Access-Control-Allow-Origin'))
            ->toBe('http://front.test')
            ->not->toBe($origin);
    })->with(['http://evil.test', 'http://front.test.evil.test', 'https://front.test']);

    it('answers a preflight request from the frontend with allowed methods and headers', function () {
        $this->call('OPTIONS', '/api/health', server: [
            'HTTP_ORIGIN' => 'http://front.test',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,authorization',
        ])
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://front.test')
            ->assertHeader('Access-Control-Max-Age', '600');
    });

    it('does not grant another origin on a preflight request', function () {
        $response = $this->call('OPTIONS', '/api/health', server: [
            'HTTP_ORIGIN' => 'http://evil.test',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ]);

        expect($response->headers->get('Access-Control-Allow-Origin'))
            ->toBe('http://front.test')
            ->not->toBe('http://evil.test');
    });
});
