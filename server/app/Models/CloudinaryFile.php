<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CloudinaryFile extends Model
{
    protected $fillable = [
        'public_id', 'url', 'type', 'model_type', 'model_id'
    ];

    public function model()
    {
        return $this->morphTo();
    }
}

