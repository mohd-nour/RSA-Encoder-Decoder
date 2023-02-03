class RSA {
  //generates a random prime number
  static randomPrime(bits) {
    const min = bigInt.one.shiftLeft(bits - 1);
    const max = bigInt.one.shiftLeft(bits).prev();

    while (true) {
      let p = bigInt.randBetween(min, max);
      if (p.isProbablePrime(256)) {
        return p;
      }
    }
  }

  static generate(keysize) {
    const e = bigInt(65537); //e is fixed at 65537
    let p;
    let q;
    let totient;

    do {
      p = this.randomPrime(keysize / 2); //random p
      q = this.randomPrime(keysize / 2); // random q
      totient = bigInt((p.minus(1)).multiply(q.minus(1))); // phi(n) = (p-1)(q-1)
    } 

    //condition for gcd(e,phi(n))=1 & |p-q| >= 2^(keysize/2 - 100)
    while (bigInt.gcd(e, totient).notEquals(1) || p.minus(q).abs().shiftRight(keysize / 2 - 100).isZero());
    return {
      e,
      n: p.multiply(q),
      d: e.modInv(totient),
    };
  }

  //Encryption: C = (M^e) modn 
  static encrypt(encodedMsg, n, e) {
    return bigInt(encodedMsg).modPow(e, n);
  }

   //Decryption: M = (C^d) modn 
  static decrypt(encryptedMsg, d, n) {
    return bigInt(encryptedMsg).modPow(d, n);
  }

  
  static encode(str) {
    const codes = str
      .split('')
      .map(i => i.charCodeAt())
      .join('');

    return bigInt(codes);
  }


  static decode(code) {
    const stringified = code.toString();
    let string = '';

    for (let i = 0; i < stringified.length; i += 2) {
      let num = Number(stringified.substr(i, 2));

      if (num <= 30) {
        string += String.fromCharCode(Number(stringified.substr(i, 3)));
        i++;
      } else {
        string += String.fromCharCode(num);
      }
    }

    return string;
  }
}


$("input[name=e-choice]").change(function() {
  keys = RSA.generate(parseInt(document.querySelector('input[name="e-choice"]:checked').value));
});

//Encryption process
$("#Encrypt").on('click', function() {
  const message = document.getElementById("message").value;
  const encoded_message = RSA.encode(message);
  const encrypted_message = RSA.encrypt(encoded_message, keys.n, keys.e);
  document.getElementById("encryption").innerHTML = encrypted_message;
  // document.getElementById("encryption").innerHTML = parseInt(document.querySelector('input[name="e-choice"]:checked').value);
});

//Decryption process
$("#Decrypt").on('click', function() {
  enc = document.getElementById("cipherText").value;
  const decrypted_message = RSA.decrypt(enc, keys.d, keys.n);
  const decoded_message = RSA.decode(decrypted_message);
  document.getElementById("decryption").innerHTML = decoded_message;
});
