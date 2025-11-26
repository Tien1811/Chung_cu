<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cloudinary_files', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();
            $table->string('url');
            $table->string('type')->nullable(); // avatar, post_image, pdf...
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cloudinary_files');
    }

};
