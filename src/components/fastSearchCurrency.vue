<template>
      <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
            <span v-for="(curr, idx) in foundCurrencies" :key="idx" @click="fastselectedTicketect(curr)" class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              {{curr}}
            </span>
          </div> 
           <div v-if="dublicate" class="text-sm text-red-600">Такой тикер уже добавлен</div> 
</template>

<script>
export default {
    props: {
        ticketValue: {
            type: String,
            required: true
        }
    },
    watch: {
        ticketValue() {
            // console.log('HERE TICKET VALUE CHANGE', this.ticketValue)
            // if(this.dublicate && !this.tickets.find(ticket => ticket.name.toUpperCase() === this.ticketValue.toUpperCase())) {
            //     this.dublicate = false;
            //     return
            // }

            // for(let curr in this.currencies) {
            //     if(~curr.indexOf(this.ticketValue.toUpperCase())) {
            //     if(this.foundCurrencies.length >= 4) {
            //         this.foundCurrencies = [curr, ...this.foundCurrencies.slice(0, 3)]
            //     } else {
            //         this.foundCurrencies.push(curr)
            //         }
            //     }
            // }

            // this.foundCurrencies.forEach(founded => {
            //     if(!founded.includes(this.ticketValue.toUpperCase())) {
            //     this.foundCurrencies = [];
            //     }
            // })

            // if(!this.ticketValue) {
            //     this.foundCurrencies = []
            // }
        },
    }
}
</script>