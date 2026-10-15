<?php

namespace App\Http\Controllers;

use App\Http\Resources\BankAccountResource;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\BankAccountRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) : AnonymousResourceCollection
    {
        return BankAccountResource::collection($request->user()->categories()->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BankAccountRequest $request) : BankAccountResource
    {
        Gate::authorize('create', BankAccount::class);

        $bankAccount = $request->user()->bankAccounts()->create($request->validated());

        return new BankAccountResource($bankAccount);
    }

    /**
     * Display the specified resource.
     */
    public function show(BankAccount $bankAccount) : BankAccountResource
    {
        Gate::authorize('view', $bankAccount);

        return new BankAccountResource($bankAccount);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BankAccountRequest $request, BankAccount $bankAccount) : BankAccountResource
    {
        Gate::authorize('update', $bankAccount);

        $bankAccount->update($request->validated());

        return new BankAccountResource($bankAccount);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BankAccount $bankAccount)
    {
        Gate::authorize('delete', $bankAccount);

        $bankAccount->delete();

        return response()->noContent();
    }
}
