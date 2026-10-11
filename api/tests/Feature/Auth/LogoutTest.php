<?php

use App\Models\User;

it('logs out and the token stops working', function () {
    $user = User::factory()->create();
    $headers = ['Authorization' => 'Bearer '.$user->createToken('spa')->plainTextToken];

    $this->postJson('/api/logout', [], $headers)->assertNoContent();

    $this->app['auth']->forgetGuards();

    $this->getJson('/api/user', $headers)->assertUnauthorized();
    expect($user->tokens()->count())->toBe(0);
});

it('revokes only the token used to log out', function () {
    $user = User::factory()->create();
    $laptop = ['Authorization' => 'Bearer '.$user->createToken('spa')->plainTextToken];
    $phone = ['Authorization' => 'Bearer '.$user->createToken('spa')->plainTextToken];

    $this->postJson('/api/logout', [], $laptop)->assertNoContent();

    $this->app['auth']->forgetGuards();

    $this->getJson('/api/user', $phone)->assertOk();
});

it('denies access to protected endpoints without a session', function (string $method, string $uri) {
    $this->json($method, $uri)->assertUnauthorized();
})->with([
    ['GET', '/api/user'],
    ['POST', '/api/logout'],
]);

it('denies access with an invalid token', function () {
    $this->getJson('/api/user', ['Authorization' => 'Bearer 1|nieprawidlowy'])->assertUnauthorized();
});

it('answers 401 instead of redirecting when the client does not ask for JSON', function () {
    $this->get('/api/user')->assertUnauthorized();
});
