<?php
namespace Gutenberg\CalendarEventTable;

use Plugandplay\Pegasus\Core\BaseBlock;
use Timber\Timber;

if (!class_exists(CalendarEventTable::class)) {
    /**
     * Class CalendarEventTable
     * @author <Pegasus>
     * @package Gutenberg\CalendarEventTable
     */
    class CalendarEventTable extends BaseBlock
    {
        protected $block;

        /**
         * @param array $block
         * @param array $fields
         * @param string $viewTemplate
         * @author <Pegasus>
         */
        public function __construct(array $block, array $fields = [])
        {
            // Custom dependency injection here
            parent::__construct($block, $fields);
            $this->block = $block;
        }

        /**
         * @return void
         * @author <Pegasus>
         */
        public function inflate(): void
        {
            parent::inflate();

            $cache_key = 'calendar_event_' . $this->getBlockId();
            $schedule = get_transient($cache_key);

            if (!$schedule) {
                $acf_schedule = [];


                $calendarId = $this->fields['google_calendar_id'] ?? '';
                $apiKey = $this->fields['google_api_key'] ?? '';

                if (empty($calendarId) || empty($apiKey)) {
                    $this->addData([
                        'schedule' => [],
                        'error' => 'Google Calendar ID or API Key is missing.'
                    ]);
                    return;
                }

                $timeMin = date('c');
                $timeMax = date('c', strtotime('+4 week'));

                $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events";
                $url .= "?key=$apiKey&timeMin=" . urlencode($timeMin) . "&timeMax=" . urlencode($timeMax) . "&singleEvents=true&orderBy=startTime&maxResults=100";

                $response = @file_get_contents($url);
                $api_schedule = [];

                if ($response !== FALSE) {
                    $data = json_decode($response, true);

                    if ($data !== null && isset($data['items'])) {
                        foreach ($data['items'] as $event) {
                            $title = $event['summary'] ?? 'empty title';
                            $start = $event['start']['dateTime'] ?? $event['start']['date'];
                            $end = $event['end']['dateTime'] ?? $event['end']['date'];

                            $startObj = new \DateTime($start);
                            $endObj = new \DateTime($end);
                            $isAllDay = strpos($start, 'T') === false;

                            if ($isAllDay) {
                                $startTime = 'all day';
                                $endTime = '';
                            } else {
                                $startTime = $startObj->format('H:i');
                                $endTime = $endObj->format('H:i');
                            }

                            $dayKey = $startObj->format('Y-m-d');
                            $dayName = $startObj->format('l');
                            $location = $event['location'] ?? null;

                            if (!isset($api_schedule[$dayKey])) {
                                $api_schedule[$dayKey] = [
                                    'name' => $dayName,
                                    'events' => []
                                ];
                            }

                            $api_schedule[$dayKey]['events'][] = [
                                'title' => $title,
                                'start' => $startTime,
                                'end' => $endTime,
                                'location' => $location,
                            ];
                        }
                    }
                }

                $schedule = $api_schedule;

                foreach ($acf_schedule as $dayKey => $dayData) {
                    if (!isset($schedule[$dayKey])) {
                        $schedule[$dayKey] = $dayData;
                    } else {
                        $schedule[$dayKey]['events'] = array_merge($schedule[$dayKey]['events'], $dayData['events'] ?? []);
                    }
                }

                set_transient($cache_key, $schedule, 15); // cache 15 sekund
            }

            $this->addData([
                'schedule' => $schedule,
            ]);
        }



        /**
         * @return string
         */
        protected function getBlockId(): string
        {
            return $this->block['id'] ?? md5(serialize($this->block));
        }
    }
}
