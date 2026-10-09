<?php

it('responds to the health check with 200 and JSON', function () {
    $this->getJson('/api/health')
        ->assertOk()
        ->assertExactJson(['status' => 'ok']);
});

it('answers unknown paths with a JSON 404, never an HTML page', function (string $path) {
    $this->get($path)
        ->assertNotFound()
        ->assertHeader('Content-Type', 'application/json')
        ->assertJsonStructure(['message']);
})->with(['/', '/api/nie-ma-takiego', '/cokolwiek']);
