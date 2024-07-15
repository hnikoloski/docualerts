<?php

namespace App\Http\Controllers;

use App\Models\CsvData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class CsvDataController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $data = array_map('str_getcsv', file($file));

        // Skip the header row
        $header = array_shift($data);

        foreach ($data as $row) {
            // Convert date format from MM/DD/YYYY to YYYY-MM-DD
            $expirationDate = Carbon::createFromFormat('m/d/Y', $row[2])->format('Y-m-d');

            // Calculate the expiration status
            $expirationStatus = $this->getExpirationStatus($expirationDate);

            // Find existing record or create a new one
            CsvData::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'title' => $row[0],
                    'type' => $row[1],
                    'expiration_date' => $expirationDate,
                ],
                [
                    'status' => $expirationStatus,
                ]
            );
        }

        return redirect()->back()->with('success', 'CSV data imported successfully.');
    }

    private function getExpirationStatus($expirationDate)
    {
        $expiration = Carbon::createFromFormat('Y-m-d', $expirationDate);
        $now = Carbon::now();

        if ($expiration->isPast()) {
            return 'Expired';
        } elseif ($expiration->diffInDays($now) <= 5) {
            return 'Soon to expire';
        } else {
            return 'Valid';
        }
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $sort = $request->input('sort', 'expiration_date');
        $order = $request->input('order', 'asc');

        $csvData = CsvData::where('user_id', Auth::id())
            ->orderBy($sort, $order)
            ->paginate($perPage);

        return response()->json($csvData);
    }

    public function sendReminder($id)
    {
        try {
            $csvData = CsvData::where('user_id', Auth::id())->findOrFail($id);
            $user = Auth::user();

            $expirationDate = Carbon::createFromFormat('Y-m-d', $csvData->expiration_date);
            $daysToExpire = Carbon::now()->diffInDays($expirationDate);

            $details = [
                'title' => $csvData->title,
                'type' => $csvData->type,
                'expiration_date' => $csvData->expiration_date,
                'days_to_expire' => $daysToExpire,
                'status' => $csvData->status,
                'user' => $user->name,
            ];

            Mail::send('emails.reminder', $details, function ($message) use ($user, $csvData) {
                $message->to($user->email)
                    ->subject('Reminder: Document Expiration')
                    ->from('hello@example.com', 'Document Management System');
            });

            return response()->json(['message' => 'Reminder email sent successfully.']);
        } catch (\Exception $e) {
            \Log::error('Error sending reminder email: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to send reminder email.'], 500);
        }
    }


    public function deleteAll()
    {
        $userId = Auth::id();
        CsvData::where('user_id', $userId)->delete();

        return response()->json(['message' => 'All data deleted successfully.']);
    }
}
