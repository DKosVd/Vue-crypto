<template>
     <section>
      <div class="flex">
        <div class="max-w-xs">
          <label for="wallet" class="block text-sm font-medium text-gray-700"
            >Тикер</label
          >
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              type="text"
              name="wallet"
              v-model="ticketValue"
              v-on:input="findMatches"
              v-on:keydown.enter="newTicket(ticketValue)"
              id="wallet"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Например DOGE"
            />
          </div>
            <fast-search-currency :ticketValue="ticketValue"/>
        </div>
      </div>
      <add-button @button-add="newTicket(ticketValue)"/>
    </section>
</template>


<script>
import addButton from './addButton.vue'
import fastSearchCurrency from './fastSearchCurrency.vue'

export default {
    components: {addButton, fastSearchCurrency},
    data() {
        return {
            ticketValue: ''
        }
    },
    emits: {
        addNewTicket: (ticketValue) => {
           return Boolean(ticketValue)
        }
    },
    methods: {
        newTicket(ticketValue) {
            this.$emit('addNewTicket', ticketValue)
            this.ticketValue = ''
        }
    }
}
</script>