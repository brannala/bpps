          seed =  -1

       seqfile = Li3lociHuman.txt
       outfile = out.txt
      mcmcfile = mcmc.txt

       diploid = 1        * 0: phased sequences, 1: unphased diploid sequences

  species&tree = 1  H
                 63  * max number of sequences

       usedata = 1    * 0: no data (prior); 1:seq like
         nloci = 3    * number of data sets in seqfile

     cleandata = 0    * remove sites with ambiguity data (1:yes, 0:no)?

    thetaprior = 3 0.002   # invgamma(a, b) for theta


       finetune = 1: 2 0.00001 0.0001  0.0005 0.5 0.2 1.0  # auto (0 or 1): finetune for GBtj, GBspr, theta, tau, mix, locusrate, seqerr

         print = 1 0 0 0  * MCMC samples, locusrate, heredityscalars, Genetrees
        burnin = 4000
      sampfreq = 2
       nsample = 10000
