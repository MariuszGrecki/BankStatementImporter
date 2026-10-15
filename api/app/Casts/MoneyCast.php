<?php

namespace App\Casts;

use Brick\Money\Money;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/**
 * @implements CastsAttributes<Money, mixed>
 */
class MoneyCast implements CastsAttributes, SerializesCastableAttributes
{
    public const CURRENCY = 'PLN';

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?Money
    {
        if ($value === null) {
            return null;
        }

        return Money::of((string) $value, self::CURRENCY);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        if (! $value instanceof Money) {
            throw new InvalidArgumentException("The [{$key}] attribute accepts only ".Money::class.' instances.');
        }

        if ($value->getCurrency()->getCurrencyCode() !== self::CURRENCY) {
            throw new InvalidArgumentException("The [{$key}] attribute accepts only ".self::CURRENCY.' amounts.');
        }

        return (string) $value->getAmount();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function serialize(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value instanceof Money ? (string) $value->getAmount() : null;
    }
}
