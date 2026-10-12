<?php

namespace App\Enums;

enum ImportStatus: string
{
    case QUEUED = 'queued';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case ROLLED_BACK = 'rolled_back';
}
