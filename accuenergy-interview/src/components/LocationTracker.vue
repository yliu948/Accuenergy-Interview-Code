<template>
  <div class="container">
    <h1>Location Tracker</h1>
    <button class="btn btn-primary" @click="acquireLocation">Get Current Location</button>
    <input type="text" v-model="searchQuery" @keyup.enter="searchLocation" placeholder="Search location...">
    <button class="btn btn-primary" @click="searchLocation">Search</button> <br /><br />

    <table class="table">
      <thead>
        <tr>
          <th>Select Location</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="location in paginatedLocations" :key="location.id">
          <td>
            <input type="checkbox" v-model="selectedLocations" :value="location.id">
          </td>
          <td>{{ location.name }}</td>
        </tr>
      </tbody>
    </table>
    <br /><br />
    <div v-show="locations.length > 10">
      <button @click="currentPage--" :disabled="currentPage === 1">Previous Page</button>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Next Page</button>
    </div>


    <br />
    <button class="btn btn-danger" @click="deleteSelectedLocations">Delete Selected Locations</button>

    <div v-if="latestLocation">
      <h3>Latest Searched Location</h3>
      <p>Location: {{ latestLocation.name }}</p>
      <p>Time Zone: {{ latestLocation.timezone }}</p>
      <p>Local Time: {{ latestLocation.localTime }}</p>
    </div>
    <br /><br />

    <GmapMap :center="{ lat: 43, lng: -79 }" :zoom="2" map-type-id="terrain" style="width: 900px; height: 700px">
      <GmapMarker :key="index" v-for="(marker, index) in markers" :position="marker.position" :clickable="true"
        :draggable="true" @click="center = marker.position" />
    </GmapMap>
  </div>
</template>

<script>
import axios from 'axios';
import { gmapApi } from 'vue2-google-maps';

export default {
  name: 'App',
  data() {
    return {
      searchQuery: '',
      locations: [],
      selectedLocations: [],
      latestLocation: null,
      markers: [],
      currentPage: 1,
      pageSize: 10
    };
  },

  computed: {
    paginatedLocations() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.locations.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.locations.length / this.pageSize);
    },
  },

  methods: {
    async acquireLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            this.addMarker('Current Location', latitude, longitude);
          },
          error => {
            console.error('Error acquiring location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    },
    async searchLocation() {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${this.searchQuery}&appid=23aab30203916a32821a68b59e1d8606`
        );

        const result = response.data;
        const { name, coord, timezone } = result;

        this.addMarker(name, coord.lat, coord.lon);
        this.latestLocation = {
          name,
          timezone,
          localTime: new Date().toLocaleTimeString(),
        };
        this.locations.push(result);
      } catch (error) {
        console.error('Error searching location:', error);
      }
    },
    addMarker(name, latitude, longitude) {
      this.markers.push({ position: { lat: latitude, lng: longitude }, name });
    },
    deleteSelectedLocations() {
      const selectedIds = this.selectedLocations;
      this.locations = this.locations.filter((location) => !selectedIds.includes(location.id));
      this.markers = this.markers.filter((marker) => !selectedIds.includes(marker.name));
      //this.markers.splice(0, this.markers.length);
      this.selectedLocations = [];
    },
  },
  mounted() {
    gmapApi()
      .then(() => {
        // Google Maps loaded successfully
      })
  },
};
</script>