<template>
    <ContentPage class="world-clock-page">
        <section class="content content--no-background world-clock-page__section">
            <v-container fluid>
                <v-row>
                    <v-col cols="12" md="7">
                        <h1 class="world-clock-page__title">
                            {{ $t('WorldClock.title') }}
                        </h1>
                        <p class="world-clock-page__subtitle">
                            {{ $t('WorldClock.subtitle') }}
                        </p>
                        <div class="world-clock-page__meta">
                            <v-icon color="secondary" left>mdi-clock-time-four-outline</v-icon>
                            <span>{{ $t('WorldClock.updatedInRealTime') }}</span>
                        </div>
                    </v-col>
                </v-row>
                <v-row class="world-clock-page__content">
                    <v-col cols="12" md="7">
                        <div class="world-clock-page__map">
                            <img :src="mapSrc" alt="World map" />
                            <v-tooltip
                                v-for="capital in capitals"
                                :key="capital.name"
                                top
                                open-delay="100"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <div
                                        class="world-clock-page__marker"
                                        :style="markerStyle(capital)"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span class="world-clock-page__marker__dot"></span>
                                    </div>
                                </template>
                                <div class="world-clock-page__tooltip">
                                    <div class="world-clock-page__tooltip__city">
                                        {{ capital.name }}
                                    </div>
                                    <div class="world-clock-page__tooltip__time">
                                        {{ formattedTime(capital) }}
                                    </div>
                                </div>
                            </v-tooltip>
                        </div>
                        <p class="world-clock-page__caption">
                            {{ $t('WorldClock.mapCaption') }}
                        </p>
                    </v-col>
                    <v-col cols="12" md="5">
                        <v-card elevation="3">
                            <v-card-title class="world-clock-page__card-title">
                                {{ $t('WorldClock.listTitle') }}
                            </v-card-title>
                            <v-divider></v-divider>
                            <v-list two-line dense>
                                <v-list-item v-for="capital in capitals" :key="capital.name">
                                    <v-list-item-content>
                                        <v-list-item-title class="world-clock-page__city-name">
                                            {{ capital.name }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="world-clock-page__timezone">
                                            {{ $t('WorldClock.timezoneLabel') }}: {{ capital.timezone }}
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-chip color="secondary" dark label>
                                            {{ formattedTime(capital) }}
                                        </v-chip>
                                    </v-list-item-action>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </section>
    </ContentPage>
</template>

<script>
import ContentPage from '@/components/page/ContentPage';
import worldMap from '@/assets/home/world.svg';
import worldMapDark from '@/assets/home/world-dark.svg';

export default {
    name: 'WorldClockPage',
    components: { ContentPage },
    data() {
        return {
            currentTime: new Date(),
            timerId: null,
            capitals: [
                {
                    name: 'Washington, D.C.',
                    timezone: 'America/New_York',
                    position: { top: '43%', left: '25%' },
                },
                {
                    name: 'London',
                    timezone: 'Europe/London',
                    position: { top: '33%', left: '48%' },
                },
                {
                    name: 'Paris',
                    timezone: 'Europe/Paris',
                    position: { top: '34%', left: '49%' },
                },
                {
                    name: 'Bucharest',
                    timezone: 'Europe/Bucharest',
                    position: { top: '38%', left: '54%' },
                },
                {
                    name: 'Cairo',
                    timezone: 'Africa/Cairo',
                    position: { top: '42%', left: '53%' },
                },
                {
                    name: 'New Delhi',
                    timezone: 'Asia/Kolkata',
                    position: { top: '46%', left: '61%' },
                },
                {
                    name: 'Tokyo',
                    timezone: 'Asia/Tokyo',
                    position: { top: '41%', left: '72%' },
                },
                {
                    name: 'Sydney',
                    timezone: 'Australia/Sydney',
                    position: { top: '73%', left: '80%' },
                },
                {
                    name: 'Brasília',
                    timezone: 'America/Sao_Paulo',
                    position: { top: '63%', left: '34%' },
                },
                {
                    name: 'Johannesburg',
                    timezone: 'Africa/Johannesburg',
                    position: { top: '66%', left: '53%' },
                },
            ],
        };
    },
    computed: {
        mapSrc() {
            return this.$vuetify.theme.dark ? worldMapDark : worldMap;
        },
    },
    mounted() {
        this.timerId = setInterval(() => {
            this.currentTime = new Date();
        }, 1000);
    },
    beforeDestroy() {
        clearInterval(this.timerId);
    },
    methods: {
        formattedTime(capital) {
            return new Intl.DateTimeFormat(this.$i18n.locale, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: capital.timezone,
            }).format(this.currentTime);
        },
        markerStyle(capital) {
            return {
                top: capital.position.top,
                left: capital.position.left,
            };
        },
    },
};
</script>

<style scoped lang="scss">
.world-clock-page {
    &__section {
        padding: 2rem 0 3rem 0;
    }
    &__title {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    &__subtitle {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }
    &__meta {
        display: flex;
        align-items: center;
        color: var(--v-secondary-base);
        font-weight: 600;
        .v-icon {
            margin-right: 0.35rem;
        }
    }
    &__content {
        margin-top: 1rem;
    }
    &__map {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
        background: var(--v-content-base);
        img {
            width: 100%;
            display: block;
        }
    }
    &__marker {
        position: absolute;
        transform: translate(-50%, -50%);
        cursor: pointer;
        &__dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--v-secondary-base);
            border: 2px solid #fff;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            display: inline-block;
        }
    }
    &__tooltip {
        min-width: 140px;
        &__city {
            font-weight: 700;
        }
        &__time {
            font-variant-numeric: tabular-nums;
        }
    }
    &__caption {
        margin-top: 0.5rem;
        color: var(--v-secondary-base);
    }
    &__card-title {
        font-weight: 700;
    }
    &__city-name {
        font-weight: 700;
    }
    &__timezone {
        font-size: 0.9rem;
        opacity: 0.8;
    }
}

@media (max-width: 960px) {
    .world-clock-page {
        &__section {
            padding-top: 1rem;
        }
        &__title {
            font-size: 2rem;
        }
        &__map {
            margin-bottom: 1rem;
        }
    }
}
</style>
