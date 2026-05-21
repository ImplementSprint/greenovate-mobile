package com.pharmacare.pos.util

import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * Background print service for PharmaCare POS.
 * Registered in AndroidManifest.xml as a foreground service.
 */
class PrintService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_NOT_STICKY
    }
}
